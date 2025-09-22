"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { TrendingUp, TrendingDown, Eye, MousePointer, ShoppingCart, DollarSign } from "lucide-react"

// Static mock data for demonstration
const mockAnalyticsData = {
  overview: {
    total_recommendations: 12,
    total_impressions: 15420,
    total_clicks: 1847,
    total_conversions: 234,
    total_revenue: 4567.89,
    ctr: 11.98,
    conversion_rate: 12.67,
  },
  performance_data: [
    { name: "Cross-sell Bundle", impressions: 3420, clicks: 412, conversions: 67, revenue: 1234.56 },
    { name: "Related Products", impressions: 2890, clicks: 356, conversions: 45, revenue: 890.23 },
    { name: "Upsell Premium", impressions: 2650, clicks: 298, conversions: 38, revenue: 756.78 },
  ],
}

// Test comment to trigger rebuild - optimized for fast development builds
const DashboardPage = () => {
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData)
  const [loading, setLoading] = useState(false) // Set to false since we're using static data

  // No API call needed - using static data
  useEffect(() => {
    // Simulate a brief loading period for demonstration
    setLoading(true)
    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData)
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Safety check to prevent crashes
  if (!analyticsData || !analyticsData.overview || !analyticsData.performance_data) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Analytics data is not available at the moment.</p>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#22c55e", "#16a34a", "#84cc16", "#6366f1", "#f43f5e"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your recommendation performance and revenue</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.overview.total_impressions.toLocaleString()}
              </p>
            </div>
            <Eye className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            +12.5% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Click-Through Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.ctr}%</p>
            </div>
            <MousePointer className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            +2.1% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.overview.conversion_rate}%</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <TrendingDown className="inline h-3 w-3 mr-1" />
            -0.8% from last period
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${analyticsData.overview.total_revenue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            <TrendingUp className="inline h-3 w-3 mr-1" />
            +18.2% from last period
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Performance by Recommendation</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.performance_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="impressions" fill="#22c55e" name="Impressions" />
              <Bar dataKey="clicks" fill="#16a34a" name="Clicks" />
              <Bar dataKey="conversions" fill="#84cc16" name="Conversions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.performance_data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {analyticsData.performance_data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${parseFloat(value || 0).toFixed(2)}`, "Revenue"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
