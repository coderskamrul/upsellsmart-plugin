import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Eye, MousePointer, ShoppingCart, DollarSign, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import DateRangePicker from "../common/DateRangePicker"
import analyticsApi from "../../services/analyticsApi"

const DashboardPage = ({ onViewCampaign }) => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    endDate: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyticsApi.getOverviewAnalytics(dateRange.startDate, dateRange.endDate)
      setAnalyticsData(data)
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      setError('Failed to load analytics data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange)
  }

  const handleViewCampaign = (campaignId) => {
    console.log('DashboardPage: View campaign clicked, ID:', campaignId, 'Type:', typeof campaignId)
    if (onViewCampaign) {
      onViewCampaign(campaignId)
    }
  }

  const handleCreateCampaign = () => {
    // Navigate to recommendations page
    window.location.href = 'admin.php?page=upsellsmart-recommendations'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Track your recommendation performance and revenue</p>
          </div>
        </div>
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
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-600">Loading analytics data...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Track your recommendation performance and revenue</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-red-200">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <div>
              <h3 className="text-lg font-semibold">Error Loading Data</h3>
              <p className="text-sm text-gray-600 mt-1">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData || !analyticsData.overview || !analyticsData.campaigns) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Track your recommendation performance and revenue</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
            <p className="text-gray-600">Start creating campaigns to see analytics data here.</p>
            <button
              onClick={handleCreateCampaign}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Your First Campaign
            </button>
          </div>
        </div>
      </div>
    )
  }

  const COLORS = ["#22c55e", "#16a34a", "#84cc16", "#6366f1", "#f43f5e"]

  const { overview, campaigns } = analyticsData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your recommendation performance and revenue</p>
        </div>
      </div>

      {/* Date Range Picker */}
      <DateRangePicker
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
        onChange={handleDateRangeChange}
      />

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.total_impressions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Total views across all campaigns
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.total_clicks.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <MousePointer className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            CTR: <span className="font-semibold text-gray-700">{overview.ctr}%</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Conversions</p>
              <p className="text-2xl font-bold text-gray-900">
                {overview.total_conversions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Rate: <span className="font-semibold text-gray-700">{overview.conversion_rate}%</span>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${overview.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            AOV: <span className="font-semibold text-gray-700">${overview.aov.toFixed(2)}</span>
          </p>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
              <p className="text-sm text-gray-600 mt-1">
                {campaigns.length} active campaign{campaigns.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <div className="p-12 text-center">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start tracking analytics.</p>
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impressions
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversions
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conv. Rate
                  </th>
                  <th className="text-right py-3 px-6 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-xs text-gray-500">ID: {campaign.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                        {campaign.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {campaign.performance.impressions.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {campaign.performance.clicks.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {campaign.performance.conversions.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right text-sm font-medium text-gray-900">
                      ${campaign.performance.revenue.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {campaign.performance.ctr.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-900">
                      {campaign.performance.conversion_rate.toFixed(2)}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewCampaign(campaign.id)}
                        className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts */}
      {campaigns.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Performance by Campaign</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaigns.map(c => ({
                name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
                impressions: c.performance.impressions,
                clicks: c.performance.clicks,
                conversions: c.performance.conversions,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" />
                <Bar dataKey="clicks" fill="#f59e0b" name="Clicks" />
                <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Revenue Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={campaigns.filter(c => c.performance.revenue > 0).map(c => ({
                    name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
                    revenue: c.performance.revenue,
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {campaigns.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${parseFloat(value || 0).toFixed(2)}`, "Revenue"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
